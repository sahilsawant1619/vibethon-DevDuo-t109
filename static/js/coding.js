// Code Runner JavaScript
class CodeRunner {
    constructor() {
        this.codeEditor = document.getElementById('codeEditor');
        this.output = document.getElementById('output');
        this.runBtn = document.getElementById('runBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyOutputBtn = document.getElementById('copyOutputBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        this.examples = {
            hello: `# Hello World Example
print("Hello, Machine Learning!")
print("Welcome to the Interactive Coding Playground!")

# Variables
name = "ML Learner"
print(f"Hello, {name}!")`,

            math: `# Math Operations Example
import math

# Basic arithmetic
print("Basic Arithmetic:")
print(f"10 + 5 = {10 + 5}")
print(f"10 - 5 = {10 - 5}")
print(f"10 * 5 = {10 * 5}")
print(f"10 / 5 = {10 / 5}")
print(f"10 % 3 = {10 % 3}")
print(f"2 ** 3 = {2 ** 3}")

# Math functions
print("\\nMath Functions:")
print(f"Pi: {math.pi}")
print(f"E: {math.e}")
print(f"Square root of 16: {math.sqrt(16)}")
print(f"Factorial of 5: {math.factorial(5)}")
print(f"Power: 2^8 = {math.pow(2, 8)}")
print(f"Ceiling of 3.2: {math.ceil(3.2)}")
print(f"Floor of 3.8: {math.floor(3.8)}")`,

            lists: `# List Operations Example
# Creating lists
numbers = [1, 2, 3, 4, 5]
fruits = ["apple", "banana", "orange", "grape"]
mixed = [1, "hello", 3.14, True]

print("Lists:")
print(f"Numbers: {numbers}")
print(f"Fruits: {fruits}")
print(f"Mixed: {mixed}")

# List operations
print("\\nList Operations:")
print(f"Length of numbers: {len(numbers)}")
print(f"First fruit: {fruits[0]}")
print(f"Last number: {numbers[-1]}")
print(f"Slice fruits[1:3]: {fruits[1:3]}")

# List methods
print("\\nList Methods:")
numbers.append(6)
print(f"After append 6: {numbers}")
numbers.remove(3)
print(f"After remove 3: {numbers}")
numbers.sort()
print(f"Sorted numbers: {numbers}")

# List comprehension
print("\\nList Comprehension:")
squares = [x**2 for x in range(1, 6)]
print(f"Squares of 1-5: {squares}")
evens = [x for x in range(1, 11) if x % 2 == 0]
print(f"Even numbers 1-10: {evens}")`,

            loops: `# Loops and Conditionals Example
# For loop
print("For Loop - Counting to 5:")
for i in range(1, 6):
    print(f"Count: {i}")

print("\\nFor Loop - Iterating over list:")
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"Fruit: {fruit}")

# While loop
print("\\nWhile Loop - Countdown:")
countdown = 5
while countdown > 0:
    print(f"T-minus {countdown}")
    countdown -= 1
print("Lift off!")

# If-elif-else
print("\\nConditionals:")
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Score: {score}")
print(f"Grade: {grade}")

# Nested loops
print("\\nNested Loops - Multiplication Table:")
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} x {j} = {i * j}")
    print()  # Empty line`,

            functions: `# Functions Example
# Simple function
def greet(name):
    return f"Hello, {name}!"

# Function with parameters
def add_numbers(a, b):
    return a + b

# Function with default parameter
def power(base, exponent=2):
    return base ** exponent

# Function with multiple return values
def calculate_stats(numbers):
    return {
        'sum': sum(numbers),
        'average': sum(numbers) / len(numbers),
        'min': min(numbers),
        'max': max(numbers),
        'count': len(numbers)
    }

# Using the functions
print("Function Examples:")
print(greet("ML Learner"))
print(f"Add 5 + 3: {add_numbers(5, 3)}")
print(f"2^3: {power(2, 3)}")
print(f"5^2 (default): {power(5)}")

# List of numbers for statistics
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
stats = calculate_stats(numbers)

print("\\nStatistics:")
for key, value in stats.items():
    print(f"{key.capitalize()}: {value}")

# Recursive function
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(f"\\nFactorial of 5: {factorial(5)}")
print(f"Factorial of 6: {factorial(6)}")`,

            error: `# Error Handling Example
# Try-except blocks
print("Error Handling Examples:")

# Division by zero
try:
    result = 10 / 0
    print(f"Result: {result}")
except ZeroDivisionError:
    print("Cannot divide by zero!")

# Index error
try:
    numbers = [1, 2, 3]
    print(f"Number at index 5: {numbers[5]}")
except IndexError:
    print("Index out of range!")

# Type error
try:
    result = "5" + 3
    print(f"Result: {result}")
except TypeError:
    print("Cannot add string and number!")

# Multiple exceptions
try:
    value = int("abc")
    print(f"Value: {value}")
except (ValueError, TypeError) as e:
    print(f"Error converting to int: {e}")

# Finally block
try:
    file_content = "Some content"
    print("Processing file...")
    # Simulate an error
    raise ValueError("File processing error")
except ValueError as e:
    print(f"Error: {e}")
finally:
    print("Cleanup completed!")

# Custom error handling
def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return "Cannot divide by zero"
    except TypeError:
        return "Invalid input types"

print(f"\\nSafe division results:")
print(f"10 / 2: {safe_divide(10, 2)}")
print(f"10 / 0: {safe_divide(10, 0)}")
print(f"10 / 'a': {safe_divide(10, 'a')}")`
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.runBtn.addEventListener('click', () => this.runCode());
        this.clearBtn.addEventListener('click', () => this.clearEditor());
        this.copyOutputBtn.addEventListener('click', () => this.copyOutput());
        
        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const example = e.currentTarget.dataset.example;
                this.loadExample(example);
            });
        });
        
        // Keyboard shortcuts
        this.codeEditor.addEventListener('keydown', (e) => {
            // Ctrl+Enter to run code
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            // Tab support
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.codeEditor.selectionStart;
                const end = this.codeEditor.selectionEnd;
                this.codeEditor.value = this.codeEditor.value.substring(0, start) + '    ' + this.codeEditor.value.substring(end);
                this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 4;
            }
        });
        
        // Auto-resize textarea
        this.codeEditor.addEventListener('input', () => {
            this.codeEditor.style.height = 'auto';
            this.codeEditor.style.height = this.codeEditor.scrollHeight + 'px';
        });
        
        // Initial resize
        this.codeEditor.style.height = 'auto';
        this.codeEditor.style.height = this.codeEditor.scrollHeight + 'px';
    }
    
    async runCode() {
        const code = this.codeEditor.value.trim();
        
        if (!code) {
            showToast('Please enter some code to run.', 'error');
            return;
        }
        
        this.showLoading(true);
        this.runBtn.disabled = true;
        this.runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
        this.runBtn.classList.add('loading');
        
        try {
            const response = await fetch('/run-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.output) {
                this.showOutput(result.output, 'success');
                showToast('Code executed successfully!', 'success');
                console.log('Code executed successfully - points update would go here');
            } else if (result.error) {
                this.showOutput(result.error, 'error');
                showToast(result.error, 'error');
            } else {
                this.showOutput('Unexpected error occurred', 'error');
                showToast('Unexpected error occurred', 'error');
            }
            
        } catch (error) {
            console.error('Error running code:', error);
            this.showOutput('Network error: Could not connect to server', 'error');
            showToast('Network error: Could not connect to server', 'error');
        } finally {
            this.showLoading(false);
            this.runBtn.disabled = false;
            this.runBtn.innerHTML = '<i class="fas fa-play"></i> Run Code';
            this.runBtn.classList.remove('loading');
        }
    }
    
    clearEditor() {
        this.codeEditor.value = '';
        this.output.textContent = 'Your code output will appear here...';
        this.codeEditor.style.height = 'auto';
        this.codeEditor.style.height = this.codeEditor.scrollHeight + 'px';
    }
    
    copyOutput() {
        const outputText = this.output.textContent;
        if (outputText && outputText !== 'Your code output will appear here...') {
            navigator.clipboard.writeText(outputText).then(() => {
                this.showToast('Output copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy output:', err);
                this.showToast('Failed to copy output', 'error');
            });
        } else {
            this.showToast('No output to copy', 'warning');
        }
    }
    
    loadExample(exampleName) {
        if (this.examples[exampleName]) {
            this.codeEditor.value = this.examples[exampleName];
            this.codeEditor.style.height = 'auto';
            this.codeEditor.style.height = this.codeEditor.scrollHeight + 'px';
            this.showToast('Example loaded successfully!');
        }
    }
    
    showOutput(text, type = 'success') {
        this.output.textContent = text;
        this.output.className = 'output-console';
        
        if (type === 'error') {
            this.output.classList.add('error');
        } else {
            this.output.classList.add('success');
        }
    }
    
    showLoading(show) {
        this.loadingSpinner.style.display = show ? 'block' : 'none';
        if (show) {
            this.output.style.display = 'none';
        } else {
            this.output.style.display = 'block';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CodeRunner();
});
