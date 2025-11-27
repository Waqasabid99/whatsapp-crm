import AgentsTable from "../components/HomePage/AgentsTable"
import Header from "../components/HomePage/Header"
import HomeCards from "../components/HomePage/HomeCards"
const Home = () => {
  return (
    <section className="max-w-full mx-5 max-h-full flex flex-col items-start justify-center overflow-hidden">
      <Header />
      <HomeCards />
      <AgentsTable />
    </section>
  )
}

export default Home
