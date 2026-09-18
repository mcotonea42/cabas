type DeleteActioProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function DeleteAction({ className = '', ...props}: DeleteActioProps) {
    return (
        <button
            className={`text-xs text-taupe hover:text-red-600 ${className}`}
            {...props}
        />
    )
}