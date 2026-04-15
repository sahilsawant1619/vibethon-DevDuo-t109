import io
import sys
import json
import threading
import concurrent.futures
from typing import Dict, Optional

class RestrictedCodeRunner:
    """Safe Python code execution with restricted environment"""
    
    def __init__(self):
        # List of dangerous modules to block
        self.blocked_modules = [
            'os', 'subprocess', 'sys', 'socket', 'urllib', 'requests',
            'shutil', 'tempfile', 'glob', 'pathlib', 'pickle', 'marshal',
            'ctypes', 'threading', 'multiprocessing', 'asyncio', 'http',
            'ftplib', 'smtplib', 'telnetlib', 'ssl', 'hashlib', 'hmac',
            'secrets', 'uuid', 'random', 'statistics', 'decimal', 'fractions'
        ]
        
        # Create restricted globals
        self.restricted_globals = {
            '__builtins__': {
                'print': print,
                'len': len,
                'str': str,
                'int': int,
                'float': float,
                'bool': bool,
                'list': list,
                'dict': dict,
                'tuple': tuple,
                'set': set,
                'range': range,
                'enumerate': enumerate,
                'zip': zip,
                'max': max,
                'min': min,
                'sum': sum,
                'abs': abs,
                'round': round,
                'sorted': sorted,
                'reversed': reversed,
                'type': type,
                'isinstance': isinstance,
                'hasattr': hasattr,
                'getattr': getattr,
                'setattr': setattr,
                'delattr': delattr,
                'dir': dir,
                'help': help,
                'repr': repr,
                'chr': chr,
                'ord': ord,
                'hex': hex,
                'oct': oct,
                'bin': bin,
                'any': any,
                'all': all,
                'divmod': divmod,
                'pow': pow,
                'complex': complex,
                'slice': slice,
                'memoryview': memoryview,
                'bytes': bytes,
                'bytearray': bytearray,
                'map': map,
                'filter': filter,
                'Exception': Exception,
                'ValueError': ValueError,
                'TypeError': TypeError,
                'NameError': NameError,
                'IndexError': IndexError,
                'KeyError': KeyError,
                'AttributeError': AttributeError,
                'ZeroDivisionError': ZeroDivisionError,
                'StopIteration': StopIteration,
                'AssertionError': AssertionError,
                'ImportError': ImportError,
                'ModuleNotFoundError': ModuleNotFoundError,
                'FileNotFoundError': FileNotFoundError,
                'PermissionError': PermissionError,
                'ConnectionError': ConnectionError,
                'TimeoutError': TimeoutError,
                'RuntimeError': RuntimeError,
                'NotImplementedError': NotImplementedError,
                'KeyboardInterrupt': KeyboardInterrupt,
                'SystemExit': SystemExit,
                'SyntaxError': SyntaxError,
                'IndentationError': IndentationError,
                'TabError': TabError,
                'UnicodeError': UnicodeError,
                'UnicodeDecodeError': UnicodeDecodeError,
                'UnicodeEncodeError': UnicodeEncodeError,
                'UnicodeTranslateError': UnicodeTranslateError,
                'ArithmeticError': ArithmeticError,
                'LookupError': LookupError,
                'OSError': OSError,
                'EOFError': EOFError,
                'BufferError': BufferError,
                'MemoryError': MemoryError,
                'OverflowError': OverflowError,
                'RecursionError': RecursionError,
                'ReferenceError': ReferenceError,
                'Warning': Warning,
                'UserWarning': UserWarning,
                'DeprecationWarning': DeprecationWarning,
                'PendingDeprecationWarning': PendingDeprecationWarning,
                'SyntaxWarning': SyntaxWarning,
                'RuntimeWarning': RuntimeWarning,
                'FutureWarning': FutureWarning,
                'ImportWarning': ImportWarning,
                'UnicodeWarning': UnicodeWarning,
                'BytesWarning': BytesWarning,
                'ResourceWarning': ResourceWarning,
                'True': True,
                'False': False,
                'None': None,
                'Ellipsis': Ellipsis,
                'NotImplemented': NotImplemented,
            },
            'math': __import__('math'),
            'datetime': __import__('datetime'),
            'time': __import__('time'),
            'collections': __import__('collections'),
            'itertools': __import__('itertools'),
            'functools': __import__('functools'),
            'operator': __import__('operator'),
            're': __import__('re'),
            'string': __import__('string'),
            'json': __import__('json'),
            'base64': __import__('base64'),
            'hashlib': __import__('hashlib'),
            'hmac': __import__('hmac'),
        }
    
    def check_blocked_imports(self, code: str) -> Optional[str]:
        """Check if code contains any blocked import statements"""
        lines = code.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('import ') or line.startswith('from '):
                for module in self.blocked_modules:
                    if module in line:
                        return f"Blocked module: {module}"
        return None
    
    def run_code_with_timeout(self, code: str, timeout: int = 3) -> Dict[str, Optional[str]]:
        """Execute code with timeout and output capture"""
        # Check for blocked imports first
        blocked_check = self.check_blocked_imports(code)
        if blocked_check:
            return {'output': None, 'error': blocked_check}
        
        # Capture stdout
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        captured_output = io.StringIO()
        captured_error = io.StringIO()
        
        try:
            sys.stdout = captured_output
            sys.stderr = captured_error
            
            # Execute code with timeout
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(self._execute_code, code)
                try:
                    future.result(timeout=timeout)
                except concurrent.futures.TimeoutError:
                    return {'output': None, 'error': 'Code execution timed out (3 seconds limit)'}
                except Exception as e:
                    return {'output': None, 'error': f'Execution error: {str(e)}'}
            
            # Get captured output
            output = captured_output.getvalue()
            error = captured_error.getvalue()
            
            return {'output': output if output.strip() else 'Code executed successfully (no output)', 'error': error if error.strip() else None}
            
        except Exception as e:
            return {'output': None, 'error': f'System error: {str(e)}'}
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr
    
    def _execute_code(self, code: str):
        """Internal method to execute code"""
        try:
            exec(code, self.restricted_globals)
        except Exception as e:
            # Re-raise to be caught by the outer try-except
            raise e

# Global instance
code_runner = RestrictedCodeRunner()

def run_python_code(code_string: str) -> Dict[str, Optional[str]]:
    """
    Run Python code in a restricted environment
    
    Args:
        code_string: Python code to execute
        
    Returns:
        Dictionary with 'output' and 'error' keys
    """
    return code_runner.run_code_with_timeout(code_string)

if __name__ == "__main__":
    # Test the code runner
    test_code = """
print("Hello, World!")
print(2 + 2)
for i in range(3):
    print(f"Count: {i}")
"""
    
    result = run_python_code(test_code)
    print("Result:", result)
    
    # Test blocked module
    blocked_code = "import os\nprint(os.getcwd())"
    result = run_python_code(blocked_code)
    print("Blocked result:", result)
