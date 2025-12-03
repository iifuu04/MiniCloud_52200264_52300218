export async function GET() {
  const body = [
    '# HELP frontend_up Whether the frontend is up',
    '# TYPE frontend_up gauge',
    'frontend_up 1',
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
    },
  });
}