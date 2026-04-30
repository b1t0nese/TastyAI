auth_users = {}


def log(text):
    with open("error.txt", "a") as f:
        f.write(str(text)+"\n")


def check_auth(ip):
    if ip in auth_users.keys():
        return auth_users[ip]
    else:
        return "Авторизация"