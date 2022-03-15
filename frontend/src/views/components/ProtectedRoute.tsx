import React from 'react';
import { useAppSelector } from '../../store';
import { useHistory, Route } from 'react-router-dom';
import { useSnackbar } from 'notistack';
type ProtectedViewProps = React.PropsWithChildren<{
  path: string;
  exact?: boolean;
  allowedRoles?: string[];
}>;

const ProtectedRoute = (props: ProtectedViewProps) => {
  const allowedRoles = props.allowedRoles || ['doctor'];
  const currentRole = useAppSelector((state) => state.user.role);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (allowedRoles.indexOf(currentRole) === -1) {
      history.push('/');
      enqueueSnackbar('You have no permission to access this page', {
        variant: 'error',
      });
    }
  }, [currentRole]);
  return <Route {...props} />;
};

export default ProtectedRoute;
