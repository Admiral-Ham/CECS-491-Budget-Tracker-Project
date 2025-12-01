from flask import Flask, request, jsonify

app = Flask(__name__)

@app.post("/login")
def login():
    data = request.json()
    username = data.get("username")
    password = data.get("password")

    if username == "TechnicSolutions" and password == "1234":
        return jsonify({"success": True, "message": "Login Ok"})
    else:
        return jsonify({"success": False, "message": "Login Failed"})

if __name__ == "__main__":
    app.run(debug=True)

