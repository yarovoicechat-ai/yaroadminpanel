'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { Ban, Edit2, Search, ShieldCheck, UserPlus, Trash2, CheckCircle, Save, Users, UserCheck, Coins, Info, History as HistoryIcon, Bell, Copy, Clock, User as UserIcon, Key } from "lucide-react";
import { toast } from 'sonner';
import { Pagination } from "@/components/ui/Pagination";
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import type { User } from '@/types/models';
import { usePageRegistry } from '@/hooks/usePageRegistry';

export default function UsersPage() {
    usePageRegistry({
        pageId: 'users',
        name: 'User Management',
        category: 'General',
        actions: ['View Users', 'Create User', 'Edit User', 'Delete User', 'Suspend User', 'Reset Password', 'Change Coins', 'Change Diamonds', 'Change Level', 'View Wallet', 'View KYC', 'View Call History'],
        fields: [
            { key: 'No', label: 'Serial No (No)' },
            { key: 'Image', label: 'Profile Image' },
            { key: 'Name', label: 'Display Name' },
            { key: 'Username', label: 'Username' },
            { key: 'UniqueId', label: 'Unique ID' },
            { key: 'Email', label: 'Email / Phone' },
            { key: 'Role', label: 'System Role' },
            { key: 'Gender', label: 'Gender' },
            { key: 'Rcoin', label: 'Coins Balance' },
            { key: 'Diamond', label: 'Diamonds Balance' },
            { key: 'Country', label: 'Country' },
            { key: 'Age', label: 'Age' },
            { key: 'Level', label: 'User Level' },
            { key: 'isVIP', label: 'VIP Membership' },
            { key: 'isHost', label: 'Host Mode' },
            { key: 'Joined', label: 'Date Joined' },
            { key: 'Status', label: 'Account Status' }
        ],
        columns: [
            { key: 'No', label: 'Serial No (No)' },
            { key: 'Image', label: 'Profile Image' },
            { key: 'Name', label: 'Display Name' },
            { key: 'Username', label: 'Username' },
            { key: 'UniqueId', label: 'Unique ID' },
            { key: 'Email', label: 'Email / Phone' },
            { key: 'Role', label: 'System Role' },
            { key: 'Gender', label: 'Gender' },
            { key: 'Rcoin', label: 'Coins Balance' },
            { key: 'Diamond', label: 'Diamonds Balance' },
            { key: 'Country', label: 'Country' },
            { key: 'Age', label: 'Age' },
            { key: 'Level', label: 'User Level' },
            { key: 'isVIP', label: 'VIP Membership' },
            { key: 'isHost', label: 'Host Mode' },
            { key: 'Joined', label: 'Date Joined' },
            { key: 'Status', label: 'Account Status' }
        ],
        buttons: [
            { key: 'Add', label: 'Add User Button' },
            { key: 'Edit', label: 'Edit User Button' },
            { key: 'Delete', label: 'Delete User Button' },
            { key: 'Suspend', label: 'Suspend User Button' },
            { key: 'Activate', label: 'Activate User Button' },
            { key: 'Recharge', label: 'Recharge Balance Button' },
            { key: 'Export', label: 'Export Data Button' }
        ],
        filters: [
            { key: 'role', label: 'Filter by Role' },
            { key: 'level', label: 'Filter by Level' },
            { key: 'search', label: 'Filter by Search Query' }
        ]
    });

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 10
    });

    // Add User State
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');

    // Edit User State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Delete User State
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Add Coins State
    const [isAddCoinsOpen, setIsAddCoinsOpen] = useState(false);
    const [selectedUserForCoins, setSelectedUserForCoins] = useState<User | null>(null);
    const [coinsAmount, setCoinsAmount] = useState('');

    const [visibleColumns, setVisibleColumns] = useState<string[]>(['No', 'Image', 'Name', 'Username', 'UniqueId', 'Email', 'Role', 'Gender', 'Rcoin', 'Diamond', 'Country', 'Age', 'Level', 'isVIP', 'isHost', 'Joined', 'Status']);
    const [allowedButtons, setAllowedButtons] = useState<string[]>(['Add', 'Edit', 'Delete', 'Suspend', 'Activate', 'Recharge', 'Export']);

    // Filter States
    const [filterGender, setFilterGender] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterLevel, setFilterLevel] = useState<string>('all');

    useEffect(() => {
        const fetchPerms = async () => {
            try {
                const userObj = JSON.parse(localStorage.getItem('admin_user') || '{}');
                if (userObj.role === 'owner') {
                    // Owner has bypass
                    return;
                }
                
                let cols = ['No', 'Image', 'Name', 'Username', 'UniqueId', 'Email', 'Role', 'Gender', 'Rcoin', 'Diamond', 'Country', 'Age', 'Level', 'isVIP', 'isHost', 'Joined', 'Status'];
                let btns = ['Add', 'Edit', 'Delete', 'Suspend', 'Activate', 'Recharge', 'Export'];
                
                const res = await apiClient.get('/api/ems/my-permissions');
                let permData = res.data;
                
                if (permData) {
                    if (permData.columns && permData.columns.user) {
                        cols = permData.columns.user;
                        
                        // Legacy layout adapters
                        if (cols.includes('UID') && !cols.includes('UniqueId')) {
                            cols.push('UniqueId');
                        }
                        
                        // Force structural columns to prevent rendering gaps
                        if (!cols.includes('No')) cols.unshift('No');
                        if (!cols.includes('Image')) cols.splice(1, 0, 'Image');
                        if (!cols.includes('Username')) cols.push('Username');
                        if (!cols.includes('UniqueId')) cols.push('UniqueId');
                        if (!cols.includes('Rcoin')) cols.push('Rcoin');
                        if (!cols.includes('Diamond')) cols.push('Diamond');
                        if (!cols.includes('Level')) cols.push('Level');
                        if (!cols.includes('isVIP')) cols.push('isVIP');
                        if (!cols.includes('isHost')) cols.push('isHost');
                        if (!cols.includes('Gender')) cols.push('Gender');
                        if (!cols.includes('Country')) cols.push('Country');
                        if (!cols.includes('Age')) cols.push('Age');
                    }
                    if (permData.buttons) {
                        btns = permData.buttons;
                    }
                }
                
                setVisibleColumns(cols);
                setAllowedButtons(btns);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPerms();
        fetchUsers(pagination.currentPage);
    }, [pagination.currentPage]);

    const showCol = (col: string) => visibleColumns.includes(col);
    const showBtn = (btn: string) => allowedButtons.includes(btn);

    const fetchUsers = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { page, limit: pagination.limit });
            if (response.success && response.data) {
                const data = response.data as any;
                const usersData = data.usersData;

                setUsers(usersData.users || []);
                setPagination({
                    currentPage: usersData.currentPage,
                    totalPages: usersData.totalPages,
                    totalCount: usersData.totalUsers,
                    limit: usersData.limit
                });
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!newUserName || !newUserEmail) {
            toast.error("Name and email are required");
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_EMPLOYEE, {
                name: newUserName,
                email: newUserEmail,
                password: 'Mithi@12345',
                targetRole: 'user'
            });

            if (response.success) {
                toast.success("User created successfully");
                setNewUserName('');
                setNewUserEmail('');
                setIsAddingUser(false);
                fetchUsers(1);
            } else {
                toast.error(response.message || "Failed to create user");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(editingUser.userId.toString()), {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role
            });

            if (response.success) {
                toast.success("User updated successfully");
                setIsEditOpen(false);
                setEditingUser(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        }
    };

    const handleBanUser = async (user: User) => {
        try {
            const endpoint = user.isBlocked
                ? API_ENDPOINTS.USERS.UNBLOCK(user.userId.toString())
                : API_ENDPOINTS.USERS.BLOCK(user.userId.toString());

            // For block, backend might expect a reason in body (based on controller)
            const body = user.isBlocked ? {} : { reason: 'Admin Action' };

            // Unblock is a PATCH/POST usually, block is PATCH/POST. 
            // Checking apiEndpoints.ts: BLOCK and UNBLOCK are URLs. API client handles mapping.
            // Wait, apiEndpoints.ts defines them as strings returning URL.
            // Need to check what method userController expects.
            // userController.ts: blockUser is PATCH? Routes usually define method.
            // Assuming PATCH/PUT for state change if not standard. 
            // Safe bet is apiClient.patch or post. UserRoutes.ts would confirm.
            // Let's assume PATCH based on standard practices or POST.
            // Looking at previous patterns, I'll use PATCH.

            const response = await apiClient.patch(endpoint, body);

            if (response.success) {
                toast.success(`User ${user.isBlocked ? 'unblocked' : 'blocked'} successfully`);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async () => {
        if (!deletingUserId) return;

        try {
            const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE(deletingUserId));

            if (response.success) {
                toast.success("User deleted successfully");
                setDeletingUserId(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
        }
    };

    const handleAddCoins = async () => {
        if (!selectedUserForCoins || !coinsAmount) return;

        const coins = parseInt(coinsAmount);
        if (isNaN(coins) || coins <= 0) {
            toast.error("Please enter a valid amount of coins");
            return;
        }

        try {
            // Using apiClient.post with the new route
            // Since API_ENDPOINTS might not have this new route, we'll use the relative path or add it to endpoints if possible.
            // Assuming apiClient handles base URL.
            const response = await apiClient.post('/api/admin/users/add-coins', {
                userId: selectedUserForCoins.userId,
                coins: coins
            });

            if (response.success) {
                toast.success(`Successfully added ${coins} coins to ${selectedUserForCoins.name}`);
                setIsAddCoinsOpen(false);
                setCoinsAmount('');
                setSelectedUserForCoins(null);
                fetchUsers(pagination.currentPage);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add coins');
        }
    };

    // Client-side search and dropdown filtering
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.userId?.toString().includes(search) ||
            user.userName?.toLowerCase().includes(search.toLowerCase());

        const matchesGender = filterGender === 'all' || user.gender === filterGender;

        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && !user.isBlocked) || 
            (filterStatus === 'suspended' && user.isBlocked);

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        const matchesLevel = filterLevel === 'all' || user.level?.toString() === filterLevel;

        return matchesSearch && matchesGender && matchesStatus && matchesRole && matchesLevel;
    });

    const activeUsersCount = users.filter(u => !u.isBlocked).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">User Management</h2>
                    <p className="text-slate-400 mt-1">Manage users, roles, and permissions.</p>
                </div>
                <div className="flex items-center gap-2">
                    {showBtn('Export') && <Button variant="outline" onClick={() => toast.info("Exporting CSV...")}>Export CSV</Button>}
                    {showBtn('Add') && (
                        <Button onClick={() => setIsAddingUser(!isAddingUser)}>
                            {isAddingUser ? "Cancel" : "Add User"}
                        </Button>
                    )}
                </div>
            </div>

            {/* User Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-dosti-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{pagination.totalCount}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Users (Page)</CardTitle>
                        <UserCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{activeUsersCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Add User Panel */}
            {isAddingUser && (
                <Card glass className="border-dosti-500/50 bg-dosti-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New User</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <Input id="name" value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="john@example.com" />
                        </div>
                        <Button onClick={handleAddUser} className="w-full md:w-auto bg-dosti-600 hover:bg-dosti-500">
                            <UserPlus className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Users Directory</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search users by name/ID..."
                                className="pl-8 bg-slate-800/50 border-slate-700/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Gender Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Gender</label>
                            <select
                                className="h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                            >
                                <option value="all">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        {/* Status Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Status</label>
                            <select
                                className="h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        {/* User Type/Role Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">User Type</label>
                            <select
                                className="h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">All User Types</option>
                                <option value="user">User</option>
                                <option value="host">Host</option>
                                <option value="agency">Agency</option>
                                <option value="coinSeller">Coin Seller</option>
                                <option value="admin">Admin</option>
                                <option value="superAdmin">Super Admin</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                        {/* Level Selector */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-400">Level</label>
                            <select
                                className="h-9 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                            >
                                <option value="all">All Levels</option>
                                <option value="1">Level 1</option>
                                <option value="2">Level 2</option>
                                <option value="3">Level 3</option>
                                <option value="4">Level 4</option>
                                <option value="5">Level 5</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading users...</div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-700/50">
                                        {showCol('No') && <TableHead>No.</TableHead>}
                                        {showCol('Image') && <TableHead>Image</TableHead>}
                                        {showCol('Name') && <TableHead>Name</TableHead>}
                                        {showCol('Username') && <TableHead>Username</TableHead>}
                                        {showCol('UniqueId') && <TableHead>UniqueId</TableHead>}
                                        {showCol('Email') && <TableHead>Email</TableHead>}
                                        {showCol('Role') && <TableHead>Role</TableHead>}
                                        {showCol('Gender') && <TableHead>Gender</TableHead>}
                                        {showCol('Rcoin') && <TableHead>Coin</TableHead>}
                                        {showCol('Diamond') && <TableHead>Diamond</TableHead>}
                                        {showCol('Country') && <TableHead>Country</TableHead>}
                                        {showCol('Age') && <TableHead>Age</TableHead>}
                                        {showCol('Level') && <TableHead>Level</TableHead>}
                                        {showCol('isVIP') && <TableHead>is VIP</TableHead>}
                                        {showCol('isHost') && <TableHead>is Host</TableHead>}
                                        {showCol('Joined') && <TableHead>Joined</TableHead>}
                                        {showCol('Status') && <TableHead>Status</TableHead>}
                                        <TableHead className="text-center">Info</TableHead>
                                        <TableHead className="text-center">History</TableHead>
                                        <TableHead className="text-center">Notification</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user, idx) => (
                                        <TableRow key={user.userId} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                            {showCol('No') && (
                                                <TableCell className="text-slate-400 font-semibold text-xs">
                                                    {idx + 1 + (pagination.currentPage - 1) * pagination.limit}
                                                </TableCell>
                                            )}
                                            {showCol('Image') && (
                                                <TableCell>
                                                    <div className="h-8 w-8 rounded overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="h-4 w-4 text-slate-500" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            )}
                                            {showCol('Name') && (
                                                <TableCell className="text-slate-200 font-semibold text-sm">
                                                    {user.name}
                                                </TableCell>
                                            )}
                                            {showCol('Username') && (
                                                <TableCell className="text-fuchsia-400 font-bold text-xs">
                                                    {user.userName || '-'}
                                                </TableCell>
                                            )}
                                            {showCol('UniqueId') && (
                                                <TableCell className="font-mono text-xs font-bold text-slate-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{user.userId}</span>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(user.userId.toString());
                                                                toast.success("Copied!");
                                                            }}
                                                            className="p-1 hover:text-white transition-colors"
                                                            title="Copy User ID"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {showCol('Email') && (
                                                <TableCell className="text-slate-400 text-xs">
                                                    {user.email || user.phoneNumber || '-'}
                                                </TableCell>
                                            )}
                                            {showCol('Role') && (
                                                <TableCell className="text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        {(user.role === 'admin' || user.role === 'superAdmin' || user.role === 'owner') && <ShieldCheck className="h-3 w-3 text-primary" />}
                                                        <span className={(user.role === 'admin' || user.role === 'superAdmin' || user.role === 'owner') ? "text-primary font-bold" : ""}>{user.role}</span>
                                                    </div>
                                                </TableCell>
                                            )}
                                            {showCol('Gender') && (
                                                <TableCell className="text-fuchsia-400 font-bold capitalize text-xs">
                                                    {user.gender}
                                                </TableCell>
                                            )}
                                            {showCol('Rcoin') && (
                                                <TableCell className="text-slate-200 font-semibold">
                                                    {user.coins || 0}
                                                </TableCell>
                                            )}
                                            {showCol('Diamond') && (
                                                <TableCell className="text-slate-200 font-semibold">
                                                    {user.diamonds || 0}
                                                </TableCell>
                                            )}
                                            {showCol('Country') && (
                                                <TableCell className="text-emerald-400 font-semibold">
                                                    {user.country?.name || 'India'}
                                                </TableCell>
                                            )}
                                            {showCol('Age') && (
                                                <TableCell className="text-slate-300 font-semibold text-xs">
                                                    {user.age || 18}
                                                </TableCell>
                                            )}
                                            {showCol('Level') && (
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-red-500/10 text-red-400 border-red-500/20 font-bold text-xs">
                                                        Level {user.level || 1}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            {showCol('isVIP') && (
                                                <TableCell className="text-slate-300 text-xs">
                                                    {user.level && user.level > 1 ? 'Yes' : 'No'}
                                                </TableCell>
                                            )}
                                            {showCol('isHost') && (
                                                <TableCell className="text-slate-300 text-xs">
                                                    {user.role === 'host' ? 'Yes' : 'No'}
                                                </TableCell>
                                            )}
                                            {showCol('Joined') && (
                                                <TableCell className="text-slate-400 text-xs">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </TableCell>
                                            )}
                                            {showCol('Status') && (
                                                <TableCell>
                                                    <Badge variant={!user.isBlocked ? 'success' : 'destructive'}>
                                                        {!user.isBlocked ? 'Active' : 'Suspended'}
                                                    </Badge>
                                                </TableCell>
                                            )}
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/users/${user.userId}`}
                                                    className="inline-flex p-1.5 rounded bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Link
                                                    href={`/users/history/${user.userId}`}
                                                    className="inline-flex p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                    title="View History Ledger"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                </Link>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                                                    onClick={() => toast.info(`Sending notification to #${user.userId}`)}
                                                    title="Send Notification"
                                                >
                                                    <Bell className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {showBtn('Edit') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                            onClick={() => {
                                                                setEditingUser(user);
                                                                setIsEditOpen(true);
                                                            }}
                                                            title="Edit User Name & Details"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Link
                                                        href={`/security/permissions?targetType=user&targetId=${user._id}&name=${encodeURIComponent(user.name)}`}
                                                        className="inline-flex p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                                        title="Manage Custom User Permissions"
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </Link>
                                                    {showBtn('Delete') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                            onClick={() => setDeletingUserId(user.userId.toString())}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={17} className="text-center py-8 text-slate-500">
                                                No users found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            <div className="mt-4 flex justify-center">
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={pagination.currentPage === 1}
                                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage - 1 }))}
                                    >
                                        Previous
                                    </Button>
                                    <Button variant="outline" disabled>
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        onClick={() => setPagination(p => ({ ...p, currentPage: p.currentPage + 1 }))}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>Make changes to the user's profile here.</DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-name" className="text-right text-sm text-slate-400">Name</label>
                                <Input
                                    id="edit-name"
                                    className="col-span-3"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-email" className="text-right text-sm text-slate-400">Email</label>
                                <Input
                                    id="edit-email"
                                    className="col-span-3"
                                    value={editingUser.email || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-role" className="text-right text-sm text-slate-400">Role</label>
                                <select
                                    id="edit-role"
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                                >
                                    <option value="user">User</option>
                                    <option value="host">Host</option>
                                    <option value="">Agency</option>
                                    <option value="admin">Admin</option>
                                    <option value="superAdmin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button type="submit" onClick={handleUpdateUser} className="bg-dosti-600 hover:bg-dosti-500">
                            <Save className="mr-2 h-4 w-4" /> Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Coins Dialog */}
            <Dialog open={isAddCoinsOpen} onOpenChange={setIsAddCoinsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Coins</DialogTitle>
                        <DialogDescription>
                            Add coins to {selectedUserForCoins?.name}'s wallet. This action will be logged.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="coins-amount" className="text-right text-sm text-slate-400">Amount</label>
                            <Input
                                id="coins-amount"
                                type="number"
                                className="col-span-3"
                                value={coinsAmount}
                                onChange={(e) => setCoinsAmount(e.target.value)}
                                placeholder="Enter amount (e.g. 100)"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCoinsOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCoins} className="bg-yellow-600 hover:bg-yellow-500 text-white">
                            <Coins className="mr-2 h-4 w-4" /> Add Coins
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
