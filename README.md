# ToDo-app

Technology Stack:
Node js
Express js
oracledb
Html
CSS

Features:
Add a new task
Delete a tasks
Update tasks as done
Delete all the tasks

Serves over https.

generate a self signed certificate using openssl

```
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```
