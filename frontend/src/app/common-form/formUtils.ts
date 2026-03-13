export const handleOptimisticStatusUpdate = async (
  id: string,
  newStatus: boolean,
  endpoint: string,
  setDataList: React.Dispatch<React.SetStateAction<any[]>>,
  setTotalActiveCount: React.Dispatch<React.SetStateAction<number>>,
  setTotalInactiveCount: React.Dispatch<React.SetStateAction<number>>,
  updateItem: any
) => {
  // 1. UI Update
  setDataList((prev) =>
    prev.map((item) => (item._id === id ? { ...item, isActive: newStatus } : item))
  );

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    await updateItem(endpoint, id, {
      isActive: newStatus,
      userId: user.id || user._id,
    });

    // 2. Stats Update
    if (newStatus) {
      setTotalActiveCount((p) => p + 1);
      setTotalInactiveCount((p) => p - 1);
    } else {
      setTotalActiveCount((p) => p - 1);
      setTotalInactiveCount((p) => p + 1);
    }
  } catch (error) {
    alert("Update failed!");
    // 3. Rollback on error
    setDataList((prev) =>
      prev.map((item) => (item._id === id ? { ...item, isActive: !newStatus } : item))
    );
  }
};