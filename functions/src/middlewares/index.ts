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