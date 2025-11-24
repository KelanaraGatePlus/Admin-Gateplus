"use client";
/* eslint-disable react/react-in-jsx-scope */
import Link from "next/link";
import NotFoundIllustration from "./NotFoundIllustration";

export default function NotFoundPage() {
  return (
    <div className="montserratFont flex min-h-screen min-w-screen items-center justify-center overflow-clip px-4 md:py-10">
      <main className="-mt-10 flex h-full w-full max-w-lg flex-col gap-4 rounded-lg border border-[#1382C9] bg-[#166CA5] px-4 py-6 [box-shadow:0px_4px_70px_rgba(19,130,201,0.7)] lg:max-w-5xl">
        <section className="flex flex-col items-center">
          <div className="relative flex h-24 w-fit items-center justify-start">
            <div className="text-white">
              <h1 className="zeinFont text-7xl font-black">404</h1>
            </div>
          </div>

          <div className="-mt-8 mb-6 flex translate-y-2">
            <p className="zeinFont text-2xl font-bold text-white">
              <span>Halaman tidak ditemukan</span>
            </p>
          </div>
        </section>
        <section className="-mt-4 flex flex-col items-center">
          <NotFoundIllustration iconName={'solar:folder-error-outline'} />
        </section>

        <section className="mt-4 flex flex-col items-center">
          <div className="-mt-7 mb-6 flex translate-y-2">
            <p className="text-center text-sm font-normal text-white/70 md:text-sm">
              <span>
                Ups! Sepertinya halaman yang kamu cari tidak tersedia atau sudah
                dipindahkan. Silakan periksa kembali URL yang kamu masukkan atau kembali ke beranda.
              </span>
            </p>
          </div>
        </section>
        <section className="flex flex-col items-center gap-2 px-3 text-white lg:flex-row-reverse lg:justify-center">
          <Link
            href="/"
            className="flex w-full justify-center rounded-lg border border-[#184A97] bg-[#156EB7] px-4 py-3 text-center text-sm font-semibold [box-shadow:0px_7px_10px_rgba(0,0,0,0.25)] md:w-fit"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/feedback"
            className="flex rounded-lg px-4 py-3 text-center text-sm font-semibold"
          >
            Laporin ke Developer
          </Link>
        </section>
      </main>
    </div>
  );
}
