import json
auth_users = {}


def check_auth(ip):
    if ip in auth_users.keys():
        return auth_users[ip]
    else:
        return "Авторизация"