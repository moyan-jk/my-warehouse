const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = 'localhost';

const server = http.createServer((req, res) => {
    // 允许访问上一级目录中的文件
// 移除URL中的查询参数
    const cleanUrl = req.url.split('?')[0];
    
    // 使用resolve确保正确解析绝对路径
    let filePath;
    if (cleanUrl === '/') {
        filePath = path.join(__dirname, 'index.html');
    } else if (cleanUrl.startsWith('/test.js') || cleanUrl.startsWith('/detailed_test.js')) {
        // 特殊处理测试脚本，从上级目录加载
        filePath = path.resolve(__dirname, '..', cleanUrl.substring(1));
    } else {
        filePath = path.join(__dirname, cleanUrl);
    }
    
    console.log('请求URL:', req.url);
    console.log('清理后的URL:', cleanUrl);
    console.log('解析后的文件路径:', filePath);
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + '..\n');
                res.end();
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}/`);
});

console.log('Server starting...');