const SpecialSection = ({ className = "" }) => {
  return (
    <div className={`border border-gray-200 rounded-md p-3 flex items-center justify-center ${className}`}>
      <span className="text-gray-800 font-medium">Зуһар</span>
    </div>
  );
};

export default SpecialSection;
