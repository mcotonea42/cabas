type CardListProps = React.LiHTMLAttributes<HTMLLIElement>;

export function CardList({ className = '', ...props }: CardListProps) {
    return (
        <li
            className={`group relative min-h-28 rounded-2xl border border-taupe/20 bg-cream p-6 transition-colors hover:border-olive/40 ${className}`}
            {...props}
        />
    )
}