import React from 'react';

const MenuSkeleton = () => {
    return (
        <div className="animate-pulse space-y-12">
            <div className="flex overflow-x-auto gap-2 pb-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-24 bg-gray-200 rounded-full flex-shrink-0" />
                ))}
            </div>

            <div className="space-y-8">
                {[1, 2].map(section => (
                    <div key={section} className="space-y-4">
                        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(item => (
                                <div key={item} className="bg-white rounded-3xl p-4 flex gap-4 h-32 opacity-50">
                                    <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0" />
                                    <div className="flex-1 space-y-3 mt-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuSkeleton;
