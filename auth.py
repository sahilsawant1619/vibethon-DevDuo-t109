from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from utils.db import get_user_by_email, create_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Handle user login"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        # Validation
        if not email or not password:
            flash('Please enter both email and password', 'danger')
            return render_template('login.html')
        
        # Get user from database
        user_data = get_user_by_email(email)
        if not user_data:
            flash('No account found with that email address', 'danger')
            return render_template('login.html')
        
        # Check password
        if not check_password_hash(user_data['password'], password):
            flash('Incorrect password', 'danger')
            return render_template('login.html')
        
        # Create User object and login
        user = User(user_data)
        login_user(user)
        
        # Update last active
        user.update_last_active()
        
        flash(f'Welcome back, {user.fullname}!', 'success')
        return redirect(url_for('dashboard'))
    
    return render_template('login.html')

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Handle user registration"""
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        fullname = request.form.get('fullname', '').strip()
        
        # Validation
        if not email or not password or not confirm_password or not fullname:
            flash('Please fill in all fields', 'danger')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long', 'danger')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return render_template('register.html')
        
        # Check if email already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            flash('An account with that email already exists', 'danger')
            return render_template('register.html')
        
        # Create new user
        password_hash = generate_password_hash(password)
        user_id = create_user(email, password_hash, fullname)
        
        if user_id is None:
            flash('Error creating account. Please try again.', 'danger')
            return render_template('register.html')
        
        # Get user data and login automatically
        user_data = get_user_by_email(email)
        if user_data:
            user = User(user_data)
            login_user(user)
            
            flash(f'Account created successfully! Welcome, {user.fullname}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Account created but login failed. Please try logging in.', 'warning')
            return redirect(url_for('auth.login'))
    
    return render_template('register.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """Handle user logout"""
    user_fullname = current_user.fullname
    logout_user()
    flash(f'Goodbye, {user_fullname}! You have been logged out.', 'info')
    return redirect(url_for('index'))
