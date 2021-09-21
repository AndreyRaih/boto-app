export function errorMiddleware(
  error: { message: any; stack: any },
  req: any, res: { headersSent: any; status: (arg0: number) => void;
    json: (arg0: { stack?: any; message: any }) => void },
    next: (arg0: any) => void
  ): void {
    if (res.headersSent) {
      next(error)
    } else {
      res.status(500)
      res.json({
        message: error.message,
        ...(process.env.NODE_ENV === 'production' ? null : {stack: error.stack}),
      })
    }
}

export function corsMiddleware(req: any, res: any, next: any): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Here allow all the HTTP methods you want
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,HEAD,PUT,OPTIONS');
    // Here you allow the headers for the HTTP requests to your server
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Method to reference to the next Node.js function in your flow
    next();
}