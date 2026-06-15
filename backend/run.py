from app import create_app

# Instantiate the Flask application via our app factory.
app = create_app()

if __name__ == '__main__':
    # Run the application with debug=True.
    # This enables the interactive debugger and auto-restarts the server on file changes.
    app.run(debug=True)
