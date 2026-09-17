type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = '', ... props}: ButtonProps) {
    return (
        <button
            className={`rounded-lg bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive/90 ${className}`}
            {...props}
        />
    )
}