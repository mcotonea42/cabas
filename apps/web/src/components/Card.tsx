type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props}: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-taupe/20 bg-cream p-8 ${className}`}
            {...props}
        />
    )
}