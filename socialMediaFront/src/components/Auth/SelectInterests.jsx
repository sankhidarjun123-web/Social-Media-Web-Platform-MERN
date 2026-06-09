import React from "react";

const interestsList = [
  "Technology",
  "Programming",
  "AI & Machine Learning",
  "Gaming",
  "Music",
  "Movies",
  "Sports",
  "Fitness",
  "Travel",
  "Photography",
  "Art",
  "Design",
  "Finance",
  "Entrepreneurship",
  "Education",
  "Science",
  "Health",
  "Food",
  "Fashion",
  "Politics"
];

export default function SelectInterests({ profileData, setProfileData }) {

  const MAX_SELECTION = 5;

  const toggleInterest = (interest) => {
    setProfileData(prev => {
      const alreadySelected = prev.interests.includes(interest);

      // remove if already selected
      if (alreadySelected) {
        return {
          ...prev,
          interests: prev.interests.filter(i => i !== interest)
        };
      }

      // limit selection
      if (prev.interests.length >= MAX_SELECTION) return prev;

      return {
        ...prev,
        interests: [...prev.interests, interest]
      };
    });
  };

  return (
    <div className="w-full px-6 space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Select Your Interests</h2>
        <span className="text-sm text-gray-500">
          {profileData.interests.length}/{MAX_SELECTION}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {interestsList.map((interest) => {
          const isSelected = profileData.interests.includes(interest);

          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`
                px-4 py-2 rounded-full border 
                transition transform duration-150
                cursor-pointer active:scale-95
                ${isSelected
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}
              `}
            >
              {interest}
            </button>
          );
        })}
      </div>

    </div>
  );
}