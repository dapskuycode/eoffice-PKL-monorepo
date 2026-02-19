import React from 'react';
import { Descriptions } from 'antd';

interface IdentitasPengajuProps {
    data: {
        namaLengkap: string
        role: string;
        nim: string;
        programStudi: string;
        email: string;
        noHP: string;
    };
}

const IdentitasPengaju: React.FC<IdentitasPengajuProps> = ({ data }) => {
    return (
        <Descriptions>
            
        </Descriptions>
    )
}