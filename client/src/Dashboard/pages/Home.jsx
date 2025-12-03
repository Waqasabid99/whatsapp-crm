import { useSearchParams } from "react-router-dom"
import AgentsTable from "../components/HomePage/AgentsTable"
import Header from "../components/HomePage/Header"
import HomeCards from "../components/HomePage/HomeCards"
import { ToastContainer } from "react-toastify"
import { useEffect } from "react"
const Home = () => {
  const [Params] = useSearchParams();
  const success = Params.get("success");
  const wabaId = Params.get("wabaId");
  const error = Params.get("error");

  return (
    <section className="max-w-full mx-5 max-h-full flex flex-col items-start justify-center overflow-hidden">
      <ToastContainer />
      <Header success={success} error={error} wabaId={wabaId} />
      <HomeCards />
      <AgentsTable />
    </section>
  )
}

export default Home
