from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(role):
    """
    A decorator to restrict route access to a specific user role.
    Uses flask_jwt_extended to verify JWT token authenticity and parse the claims.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                # verify_jwt_in_request checks if a valid JWT is present in the request.
                # It will raise an exception if the token is missing, expired, or invalid.
                verify_jwt_in_request()
            except Exception as e:
                # Log the specific error to the console for easier debugging
                print(f"JWT verification failed: {e}")
                # If no token is provided or the token is invalid, return a 401 Unauthorized response.
                return jsonify({'error': 'Missing or invalid token'}), 401

            
            # Reads the custom claims (metadata payload) stored inside the JWT token.
            claims = get_jwt()
            
            # Reads the 'role' claim and checks if it matches the required role.
            # If not, return a 403 Forbidden response.
            if claims.get('role') != role:
                return jsonify({'error': 'Access forbidden'}), 403
            
            # If all checks pass, execute the actual route function.
            return fn(*args, **kwargs)
        return wrapper
    return decorator
