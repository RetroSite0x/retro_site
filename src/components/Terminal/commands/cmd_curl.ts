import type { CommandHandler } from '../../../types/terminal';

const BOOKMARKS: Record<string, string> = {
  'github.com': `HTTP/1.1 200 OK
Content-Type: text/html
Server: nabil-httpd/1.0
Content-Length: 0

<!DOCTYPE html>
<html>
<head><title>GitHub</title></head>
<body><!-- Simulated GitHub response --></body>
</html>`,

  'nabil.iam.bd': `HTTP/1.1 200 OK
Content-Type: text/html
Server: nabil-httpd/1.0
Content-Length: 0

<!DOCTYPE html>
<html>
<head><title>Ann Naser Nabil</title></head>
<body><!-- Welcome to nabil.iam.bd --></body>
</html>`,

  'google.com': `HTTP/1.1 301 Moved Permanently
Location: https://www.google.com/
Server: nabil-httpd/1.0
Content-Length: 0`,

  'arxiv.org': `HTTP/1.1 200 OK
Content-Type: text/html
Server: nabil-httpd/1.0
Content-Length: 0

<!DOCTYPE html>
<html>
<head><title>arXiv</title></head>
<body><!-- Results for Ann Naser Nabil --></body>
</html>`,

  'huggingface.co': `HTTP/1.1 200 OK
Content-Type: text/html
Server: nabil-httpd/1.0
Content-Length: 0

<!DOCTYPE html>
<html>
<head><title>HuggingFace - AnnNaserNabil</title></head>
<body><!-- Profile: AnnNaserNabil --></body>
</html>`,
};

export const cmd_curl: CommandHandler = (args) => {
  if (args.length === 0) {
    return {
      type: 'output',
      content: [
        'Usage: curl [URL]',
        '',
        'Simulated HTTP requests (no network activity):',
        '',
        '  curl github.com',
        '  curl nabil.iam.bd',
        '  curl google.com',
        '  curl arxiv.org',
        '  curl huggingface.co',
      ].join('\n'),
    };
  }

  const url = args[0].toLowerCase();

  // Try to match a known bookmark
  let matched = false;
  for (const [key, response] of Object.entries(BOOKMARKS)) {
    if (url.includes(key)) {
      matched = true;
      return { type: 'output', content: response };
    }
  }

  if (!matched) {
    return {
      type: 'output',
      content: `HTTP/1.1 404 Not Found
Server: nabil-httpd/1.0
Content-Length: 0

curl: (6) Could not resolve host: ${args[0]}`,
    };
  }

  return { type: 'output', content: '' };
};
