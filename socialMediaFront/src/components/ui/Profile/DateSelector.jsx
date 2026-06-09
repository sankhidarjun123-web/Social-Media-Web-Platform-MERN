function DateSelector({ profileData, setProfileData }) {

    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const years = Array.from({ length: 100 }, (_, i) => 2026 - i);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProfileData(prev => ({
            ...prev,
            DOB: {
                ...prev.DOB,
                [name]: value
            }
        }));
    };

    const dob = profileData.DOB || {
        day: "",
        month: "",
        year: ""
    };

    return (
        <div className="w-full grid grid-cols-[1fr_2fr_2fr] gap-2">

            {/* Day */}
            <label className="w-full flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="day"
                    value={dob.day}
                    onChange={handleChange}
                >
                    <option value="">Day</option>
                    {days.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </label>

            {/* Month */}
            <label className="w-full flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="month"
                    value={dob.month}
                    onChange={handleChange}
                >
                    <option value="">Month</option>
                    {months.map((m, index) => (
                        <option key={m} value={index + 1}>{m}</option>
                    ))}
                </select>
            </label>

            {/* Year */}
            <label className="w-full flex justify-center">
                <select
                    className="w-[80%] inp-cl"
                    name="year"
                    value={dob.year}
                    onChange={handleChange}
                >
                    <option value="">Year</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </label>

        </div>
    );
}

export default DateSelector;