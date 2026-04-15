const filteredUsers = useMemo(() => {
const now = new Date('2024-03-25T06:43:36').getTime();
const results = usersData.filter(user => {
const searchLower = searchQuery.toLowerCase();
const matchesSearch =
user.fullName.toLowerCase().includes(searchLower) ||
user.username.toLowerCase().includes(searchLower) ||
user.email.toLowerCase().includes(searchLower) ||
(user.phoneNumber && user.phoneNumber.includes(searchQuery)) ||
user.id.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'All Status' || user.status === statusFilter;

      let matchesJoined = true;
      if (joinedFilter === 'Last 24h') {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        matchesJoined = user.joinedTimestamp > oneDayAgo;
      } else if (joinedFilter === 'Last 7 Days') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        matchesJoined = user.joinedTimestamp > sevenDaysAgo;
      }

      return matchesSearch && matchesStatus && matchesJoined;
    });

    // Default sort by joined timestamp descending (newest first)
    return results.sort((a, b) => b.joinedTimestamp - a.joinedTimestamp);

}, [searchQuery, statusFilter, joinedFilter]);
