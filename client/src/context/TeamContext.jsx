import { createContext, useContext, useState } from 'react';
import {
  getTeams as getTeamsApi,
  createTeam as createTeamApi,
  getTeamById as getTeamByIdApi,
  addMember as addMemberApi,
  updateMemberCapacity as updateMemberCapacityApi,
  removeMember as removeMemberApi
} from '../utils/api';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await getTeamsApi();
      setTeams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamById = async (id) => {
    setLoading(true);
    try {
      const { data } = await getTeamByIdApi(id);
      setCurrentTeam(data);
      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData) => {
    const { data } = await createTeamApi(teamData);
    setTeams([...teams, data]);
    return data;
  };

  const addMember = async (teamId, memberData) => {
    const { data } = await addMemberApi(teamId, memberData);
    setCurrentTeam(data);
    return data;
  };

  const updateMemberCapacity = async (teamId, memberData) => {
    const { data } = await updateMemberCapacityApi(teamId, memberData);
    setCurrentTeam(data);
    return data;
  };

  const removeMember = async (teamId, memberData) => {
    await removeMemberApi(teamId, memberData);
    await fetchTeamById(teamId);
  };

  return (
    <TeamContext.Provider value={{
      teams,
      currentTeam,
      loading,
      fetchTeams,
      fetchTeamById,
      createTeam,
      addMember,
      updateMemberCapacity,
      removeMember
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);