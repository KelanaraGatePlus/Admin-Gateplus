import { Search } from "lucide-react";

export default function AppNavbar() {
    return (
        <nav className="w-full flex flex-row items-center justify-between px-2">
            <div className="flex-col gap-2 text-sm">
                <h1 className="font-bold">Admin Gate+</h1>
                <p className="font-semibold">Have a good mood today</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <input
                        className="bg-white rounded-full pl-4 pr-10 py-2 text-md font-bold outline-none border border-gray-200 focus:ring-2 focus:ring-[#02576E]"
                        placeholder="Search..."
                    />
                    <Search
                        className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                    />
                </div>
            </div>
        </nav>
    )
}
