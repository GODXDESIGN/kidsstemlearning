import sqlite3
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import os

DB_FILE = 'database.sqlite'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS progress (
            userId TEXT PRIMARY KEY,
            abcLevel INTEGER DEFAULT 1,
            abcStreak INTEGER DEFAULT 0,
            puzzleLevel INTEGER DEFAULT 1,
            puzzleStreak INTEGER DEFAULT 0,
            wordsMastered TEXT DEFAULT '[]'
        )
    ''')
    conn.commit()
    conn.close()

class SimpleAPI(BaseHTTPRequestHandler):
    
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        # Enable CORS for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        # Serve static files for the frontend if root or /index.html
        if self.path == '/' or self.path == '/index.html' or self.path.startswith('/css/') or self.path.startswith('/js/'):
            try:
                # Basic static file server logic
                path = self.path
                if path == '/':
                    path = '/index.html'
                    
                file_path = "." + path
                if os.path.exists(file_path):
                    ext = os.path.splitext(file_path)[1]
                    content_type = 'text/html'
                    if ext == '.css': content_type = 'text/css'
                    if ext == '.js': content_type = 'application/javascript'
                    
                    with open(file_path, 'rb') as f:
                        self.send_response(200)
                        self.send_header('Content-type', content_type)
                        self.end_headers()
                        self.wfile.write(f.read())
                    return
            except Exception as e:
                print(f"Error serving static file: {e}")

        # API Route logic
        if self.path.startswith('/api/progress/'):
            user_id = self.path.split('/')[-1]
            try:
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute('SELECT * FROM progress WHERE userId = ?', (user_id,))
                row = c.fetchone()
                
                if row:
                    data = {
                        'userId': row[0],
                        'abcLevel': row[1],
                        'abcStreak': row[2],
                        'puzzleLevel': row[3],
                        'puzzleStreak': row[4],
                        'wordsMastered': json.loads(row[5])
                    }
                else:
                    data = {
                        'userId': user_id, 'abcLevel': 1, 'abcStreak': 0, 
                        'puzzleLevel': 1, 'puzzleStreak': 0, 'wordsMastered': []
                    }
                    c.execute('INSERT INTO progress VALUES (?, 1, 0, 1, 0, ?)', (user_id, '[]'))
                    conn.commit()
                
                conn.close()
                self._set_headers()
                self.wfile.write(json.dumps(data).encode('utf-8'))
            except Exception as e:
                print(f"DB Read Error: {e}")
                self._set_headers(500)
                self.wfile.write(b'{"error": "Database error"}')
        else:
            self._set_headers(404)
            self.wfile.write(b'{"error": "Not found"}')

    def do_POST(self):
        if self.path.startswith('/api/progress/'):
            user_id = self.path.split('/')[-1]
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                
                # Check if exists
                c.execute('SELECT userId FROM progress WHERE userId = ?', (user_id,))
                if c.fetchone():
                    c.execute('''
                        UPDATE progress SET 
                        abcLevel=?, abcStreak=?, puzzleLevel=?, puzzleStreak=?, wordsMastered=?
                        WHERE userId=?
                    ''', (
                        data.get('abcLevel', 1), data.get('abcStreak', 0),
                        data.get('puzzleLevel', 1), data.get('puzzleStreak', 0),
                        json.dumps(data.get('wordsMastered', [])), user_id
                    ))
                else:
                    c.execute('INSERT INTO progress VALUES (?, ?, ?, ?, ?, ?)', (
                        user_id, data.get('abcLevel', 1), data.get('abcStreak', 0),
                        data.get('puzzleLevel', 1), data.get('puzzleStreak', 0),
                        json.dumps(data.get('wordsMastered', []))
                    ))
                
                conn.commit()
                conn.close()
                self._set_headers()
                self.wfile.write(b'{"success": true}')
            except Exception as e:
                print(f"DB Write Error: {e}")
                self._set_headers(500)
                self.wfile.write(b'{"error": "Database error"}')

if __name__ == '__main__':
    init_db()
    server_address = ('', 3000)
    httpd = HTTPServer(server_address, SimpleAPI)
    print("Python Backend API running at port 3000...")
    httpd.serve_forever()
