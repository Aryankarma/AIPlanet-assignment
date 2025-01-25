import bcrypt

password = b"testpassword"
hashed = bcrypt.hashpw(password, bcrypt.gensalt())
print(hashed)
print(bcrypt.checkpw(password, hashed))
