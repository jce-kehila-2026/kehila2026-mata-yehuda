<h2>סינון פעילויות</h2>

            <div className="row">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="">כל סוגי הפעילויות</option>

                    {activityTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.data.type_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row">
                <select
                    value={filterOpen}
                    onChange={(e) => setFilterOpen(e.target.value)}
                >
                    <option value="">כל הסטטוסים</option>
                    <option value="true">פתוח</option>
                    <option value="false">סגור</option>
                </select>
            </div>