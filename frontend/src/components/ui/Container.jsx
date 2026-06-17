export default function Container({ children, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`site-container ${className}`.trim()}>
      {children}
    </Tag>
  )
}
