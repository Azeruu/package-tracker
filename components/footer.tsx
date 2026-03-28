"use client"

export function Footer() {
  return (
    <footer className="bg-white dark:bg-black/50 backdrop-blur-3xl flex justify-center items-center p-2">
      <div className="w-full h-16 flex items-center justify-center">
        <p className="text-center text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Package Tracker. All rights
          reserved.
          <br />
          Created by <a href="https://github.com/azeru">Azeru</a>
        </p>
      </div>
    </footer>
  )
}