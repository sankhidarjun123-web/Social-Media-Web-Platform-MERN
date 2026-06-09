import { useState } from "react";

const DeleteAccount = ({ onDelete, del, setDel, loading, isGoogleUser }) => {
    const [step, setStep] = useState(0);
    const [password, setPassword] = useState("");

    if (!del) return null;

    const handleClose = () => {
        setPassword("");
        setStep(0);
        setDel(false);
    };

    const handleDelete = async () => {
        if (!password.trim() && !isGoogleUser) return;

        try {
            await onDelete(password);

            setPassword("");
            setStep(0);
            setDel(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
            <div className="w-[90%] max-w-md bg-white rounded-xl shadow-xl p-6 flex flex-col gap-4">

                {/* Step 0 - Initial Confirmation */}
                {step === 0 && (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">
                            Delete Account
                        </h2>

                        <p className="text-slate-700">
                            Are you sure you want to permanently delete your
                            account?
                        </p>

                        <p className="text-sm text-slate-500">
                            This action cannot be undone and all associated
                            data will be lost forever.
                        </p>

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={handleClose}
                                className="
                                    px-4
                                    py-2
                                    border
                                    border-slate-300
                                    rounded-lg
                                    hover:bg-slate-100
                                    cursor-pointer
                                "
                            >
                                No
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="
                                    px-4
                                    py-2
                                    bg-red-600
                                    text-white
                                    rounded-lg
                                    hover:bg-red-700
                                    cursor-pointer
                                "
                            >
                                Yes
                            </button>
                        </div>
                    </>
                )}

                {/* Step 1 - Password Confirmation */}
                {step === 1 && (
                    <>
                        <h2 className="text-xl font-semibold text-red-600">
                            Confirm Account Deletion
                        </h2>

                        <p className="text-slate-700">
                            Please enter your password to continue.
                        </p>

                        {!isGoogleUser && <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="
                                h-10
                                px-3
                                border
                                border-slate-300
                                rounded-lg
                                outline-none
                                focus:border-red-400
                            "
                        />}

                        <div className="flex justify-end gap-3 mt-2">
                            <button
                                onClick={handleClose}
                                className="
                                    px-4
                                    py-2
                                    border
                                    border-slate-300
                                    rounded-lg
                                    hover:bg-slate-100
                                    cursor-pointer
                                "
                            >
                                Cancel
                            </button>

                            <button
                                disabled={!password.trim() && !isGoogleUser}
                                onClick={() => handleDelete()}
                                className={`
                                    px-4
                                    py-2
                                    ${!loading ? "bg-red-600" : "bg-black"}
                                    text-white
                                    rounded-lg
                                    ${!loading && "hover:bg-red-700"}
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    cursor-pointer
                                `}
                            >
                                {loading ? "Deleting..." : 
                                "Confirm & Delete"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DeleteAccount;