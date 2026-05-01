import { useSearchParams } from "react-router-dom"
import AgentsTable from "../components/HomePage/AgentsTable"
import Header from "../components/HomePage/Header"
import HomeCards from "../components/HomePage/HomeCards"
import { ToastContainer } from "react-toastify"
import APIModal from "../../ui/APIModal"
import { useEffect, useState } from "react"

const Home = () => {
  const [Params] = useSearchParams();
  const [showAPIModal, setShowAPIModal] = useState(false);
  const success = Params.get("success");
  const wabaId = Params.get("wabaId");
  const apiKey = Params.get("apiKey");
  console.log(apiKey)
  const error = Params.get("error");

  useEffect(() => {
    if (success === "true" && apiKey) {
      setShowAPIModal(true);
    } else {
      setShowAPIModal(false);
    }
  }, [success, apiKey])

  return (
    <section className="max-w-full mx-5 max-h-full flex flex-col items-start justify-center overflow-hidden">
      <ToastContainer />
      <Header success={success} error={error} wabaId={wabaId} apiKey={apiKey} />
      <HomeCards />
      {showAPIModal && <APIModal plainTextAPI={apiKey} showAPIModal={setShowAPIModal} />}
      <AgentsTable />
    </section>
  )
}

export default Home
