import BarLoader from "react-spinners/BarLoader";

export default function Loader({ label }: { label?: string }) {
	return (
		<div className="flex flex-col justify-center items-center place-items-center h-screen bg-slate-100 my-auto">
			<img src="/img/vatacars-logo.png" className="mb-4 h-16 animate-pulse" alt="" />
			<div className="my-3 flex">
				<BarLoader loading={true} color="#3b82f6" height={5} width={200} />
			</div>
			<p className="text-slate-800 text-center mt-2 text-lg">{label}</p>
		</div>
	);
}
