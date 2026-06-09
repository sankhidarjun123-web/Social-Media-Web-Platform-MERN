import { ClipLoader } from "react-spinners";

function Loader({ size, color }) {
  return (
    <div className="inline-flex items-center justify-center py-3">
      <ClipLoader size={size ? size : 25} color={color ? color : "blue"} />
    </div>
  );
}

export default Loader;