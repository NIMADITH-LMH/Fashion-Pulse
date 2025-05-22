import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import moment from 'moment';
import { MdModeEdit } from 'react-icons/md';
import ChangeUserRole from '../components/changeUserRole';


const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState({
    email: '',
    name: '',
    role: '',
    _id: ''

  });

  const fetchAllUsers = async () => {
    const fetchData = await fetch(SummaryApi.allUser.url, {
      method: SummaryApi.allUser.method,
      credentials: 'include'
    });

    const dataResponse = await fetchData.json();

    if (dataResponse.success) {
      setAllUsers(dataResponse.data);
    }

    if (dataResponse.error) {
      toast.error(dataResponse.message);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="bg-white pb-1">
      <table className="w-full userTable">
        <thead>
          <tr className="bg-black text-white">
            <th>Sr.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allUser.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No users available
              </td>
            </tr>
          ) : (
            allUser.map((e1, index) => (
              <tr key={e1._id || index}>
                <td>{index + 1}</td>
                <td>{e1.name}</td>
                <td>{e1.email}</td>
                <td>{e1.role}</td>
                <td>{moment(e1.createdAt).format('DD-MM-YYYY')}</td>
                <td>
                  <button className='bg-green-100 p-2 rounded-full cursor-pointer hover:bg-green-500 hover:text-white'onClick={() => setOpenUpdateRole(true)}>
                  <MdModeEdit
                    className="text-blue-500 cursor-pointer"
                    onClick={() => {
                      setUpdateUserDetails(e1);
                      setOpenUpdateRole(true);
                    }}
                  />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {
        openUpdateRole && (
          <ChangeUserRole
            onClose={() => setOpenUpdateRole(false)}
            name={updateUserDetails.name}
            email={updateUserDetails.email}
            role={updateUserDetails.role}
            userId={updateUserDetails._id}
            callFunc={fetchAllUsers} 
          />
        )
      }
      
    </div>
  );
};

export default AllUsers;
