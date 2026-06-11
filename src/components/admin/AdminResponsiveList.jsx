function AdminResponsiveList({ desktopTable, mobileCards }) {
    return (
        <>
            <div className="admin-responsive-list__desktop">{desktopTable}</div>
            <div className="admin-responsive-list__mobile">{mobileCards}</div>
        </>
    );
}

export default AdminResponsiveList;
