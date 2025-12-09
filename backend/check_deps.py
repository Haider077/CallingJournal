try:
    import multipart
    print("python-multipart is installed")
except ImportError:
    print("python-multipart is NOT installed")

try:
    import email_validator
    print("email-validator is installed")
except ImportError:
    print("email-validator is NOT installed")
