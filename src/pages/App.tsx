import Layout from "@/pages/layout";
import { Button } from "@/components/ui/button";

function App() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-svh">
        <Button>Click me</Button>
      </div>
    </Layout>
  );
}

export default App;
