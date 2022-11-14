export const Button = ({ children, disabled, ...props }) => (
  <button
    className={`
    ${
      disabled ? "bg-gray-500" : "bg-green-500"
    } text-white font-bold py-2 px-4 rounded focus:ring transform transition hover:scale-105 duration-300 ease-in-out uppercase`}
    type="button"
    {...props}
  >
    {children}
  </button>
);
