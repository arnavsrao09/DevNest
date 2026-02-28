const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <div>
          <h1>DashBoard NavBar</h1>
          {children}
        </div>
      </body>
    </html>
  )
}

export default layout
