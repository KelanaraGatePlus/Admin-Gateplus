import { Input } from "../ui/input";

export default function DefaultInputText({ placeholder = "Enter text", ...props }) {
    return (
        <Input className="w-full" type={'text'} placeholder={placeholder} {...props} />
    );
}