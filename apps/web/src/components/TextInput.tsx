type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className = '', ...props}: TextInputProps) {
    return (
        <input
            className={`rounded-lg border border-taupe/40 px-3 py-2 text-sm focus:border-olive focus:outline-none ${className}`}
            {...props}
        />
    )
}