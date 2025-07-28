import { combineClasses } from "./utils.js"; // Import from utils.js

const ContentBox = ({ children, className = "" }) => {
  // Use combineClasses from utils.js (plain JavaScript file)
  const combinedClasses = combineClasses('border border-gray-200 rounded-md p-3', className);
  
  return (
    <View className={combinedClasses}>
      {children}
    </View>
  );
};

export default ContentBox;
