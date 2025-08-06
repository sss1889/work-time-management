
import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../../context/DataContext';
import { User, Role, PayType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const UserForm: React.FC<{ user?: User | null; onSave: (user: Omit<User, 'id'> | User) => void; onCancel: () => void; }> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role: user?.role || Role.USER,
        payType: user?.payType || PayType.HOURLY,
        payRate: user?.payRate || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'payRate' ? parseFloat(value) : value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave: any = { ...formData };
        if (user?.id) {
            dataToSave.id = user.id;
            // Don't update password if it's empty during edit
            if(!dataToSave.password) delete dataToSave.password;
        }
        onSave(dataToSave);
    };

    return (
        <Card className="p-6 my-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">{user ? 'ユーザー編集' : '新規ユーザー追加'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="名前" name="name" value={formData.name} onChange={handleChange} required />
                    <Input label="メール" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <Input label={user ? "新しいパスワード（任意）" : "パスワード"} name="password" type="password" value={formData.password} onChange={handleChange} required={!user} />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">役割</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            <option value={Role.USER}>ユーザー</option>
                            <option value={Role.ADMIN}>管理者</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">給与形態</label>
                        <select name="payType" value={formData.payType} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                            <option value={PayType.HOURLY}>時給</option>
                            <option value={PayType.MONTHLY}>月給</option>
                        </select>
                    </div>
                    <Input label={formData.payType === PayType.HOURLY ? '時給' : '月給'} name="payRate" type="number" value={formData.payRate} onChange={handleChange} required />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={onCancel}>キャンセル</Button>
                    <Button type="submit">ユーザーを保存</Button>
                </div>
            </form>
        </Card>
    );
};


const UserManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser } = useContext(DataContext);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSaveUser = (user: Omit<User, 'id'> | User) => {
        if ('id' in user) {
            updateUser(user);
        } else {
            addUser(user as Omit<User, 'id'>);
        }
        setIsFormOpen(false);
        setEditingUser(null);
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setIsFormOpen(true);
    };
    
    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800">ユーザー管理</h2>
                 {!isFormOpen && <Button onClick={handleAddNew}>新規ユーザー追加</Button>}
            </div>

            {isFormOpen && <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCancel} />}

            <Card className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">名前</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">メール</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">役割</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">給与情報</th>
                            <th className="relative px-6 py-3"><span className="sr-only">操作</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === Role.ADMIN ? 'bg-primary-100 text-primary-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Intl.NumberFormat('ja-JP').format(user.payRate)} JPY / {user.payType === PayType.HOURLY ? 'hr' : 'mo'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button onClick={() => handleEdit(user)} variant="secondary">編集</Button>
                                    <Button onClick={() => deleteUser(user.id)} variant="danger" disabled={user.role === Role.ADMIN}>削除</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};

export default UserManagement;
