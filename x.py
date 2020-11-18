import socket
conn=socket.create_connection(("localhost","8080"))
conn.sendall(b"hello")
data=conn.recv(1024)
if not data: 
    print('null')
print(data)
