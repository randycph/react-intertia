import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Container,
  Form,
  Row,
  Table,
  Modal,
  Dropdown,
} from "react-bootstrap";
import { Head, Link, usePage, router } from "@inertiajs/react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { isEmpty } from "lodash";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageProps } from "@/types";
import "react-toastify/dist/ReactToastify.css";

import TableContainer from "../../Components/Common/TableContainer";
import DeleteModal from "../../Components/Common/DeleteModal";
import Layout from "../../Layouts";
import Loader from "../../Components/Common/Loader";

type User = {
  id: number;
  name: string;
  email: string;
  roles: { id: number; name: string }[];
  status: string;
  created_at: string;
};

type Role = {
  id: number;
  name: string;
};

interface UsersPageProps {
  users: User[];
  roles: Role[];
}

const UsersIndex = () => {
  const { users, roles, errors } = usePage<PageProps<UsersPageProps>>().props;

  const [isEdit, setIsEdit] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User[]>(users);

  useEffect(() => {
    setUserData(users);
  }, [users]);

  // Delete Users
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setUser(null);
    } else {
      setModal(true);
      setUser(null);
    }
  }, [modal]);

  // validation
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      id: user?.id || "",
      name: user?.name || "",
      email: user?.email || "",
      roles: user ? user.roles.map((r) => Number(r.id)) : [],
      password: "",
      password_confirmation: "",
      status: user?.status || "active",
    },

    validationSchema: Yup.object({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: isEdit
        ? Yup.string().min(8).notRequired()
        : Yup.string().min(8).required(),
      password_confirmation: isEdit
        ? Yup.string().notRequired()
        : Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .required(),
      roles: Yup.array().min(1, "Select at least one role"),
      status: Yup.string().required(),
    }),

    onSubmit: (values) => {
      if (isEdit && user) {
        router.put(`/admin/users/${user.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else if (isChangePassword && user) {
        router.put(`/admin/users/change-password/${user.id}`, values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      } else {
        router.post("/admin/users", values, {
          onSuccess: () => {
            validation.resetForm();
            toggle(); // close ONLY on success
          },
        });
      }
    },
  });

  useEffect(() => {
    if (errors) {
      validation.setErrors(errors as any);
    }
  }, [errors]);

  // Delete Data
  const handleDeleteUser = () => {
    if (user) {
      router.delete(`/admin/users/${user.id}`);
      setDeleteModal(false);
    }
  };

  // Get Data
  useEffect(() => {
    setUserData(users);
  }, [users]);

  useEffect(() => {
    if (!isEmpty(users)) {
      setUser(users[0]);
      setIsEdit(false);
    }
  }, [users]);

  // Add Data
  const handleUsersClicks = () => {
    setUser(null);
    setIsEdit(false);
    toggle();
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall: any = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".userCheckBox");

    if (checkall.checked) {
      ele.forEach((ele: any) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele: any) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  const handleEditUser = (userData: User) => {
    setIsEdit(true);
    setUser(userData);

    validation.setValues({
      name: userData.name,
      email: userData.email,
      roles: userData.roles.map((r) => Number(r.id)),
      status: userData.status,
    });

    setModal(true); // open modal LAST
  };

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState<any>([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] =
    useState<boolean>(false);

  const deleteMultiple = () => {
    const ids = Array.from(selectedCheckBoxDelete).map((el: any) =>
      Number(el.value)
    );

    router.post("/admin/users/bulk-delete", { ids });

    const checkall: any = document.getElementById("checkBoxAll");

    setIsMultiDeleteButton(false);

    setTimeout(() => {
      toast.clearWaitingQueue();
    }, 3000);

    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".userCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  const columns = useMemo(
    () => [
      {
        header: (
          <Form.Check.Input
            type="checkbox"
            id="checkBoxAll"
            className="form-check-input"
            onClick={() => checkedAll()}
          />
        ),
        cell: (cellProps: any) => {
          const userId = cellProps.row.original.id;

          if (userId === 1) {
            return null;
          }

          return (
            <Form.Check.Input
              type="checkbox"
              className="userCheckBox form-check-input"
              value={userId}
              onChange={() => deleteCheckbox()}
            />
          );
        },
        id: "#",
      },
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Email",
        accessorKey: "email",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <>{cellProps.getValue()}</>;
        },
      },
      {
        header: "Role",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          const roles = cellProps.row.original.roles;

          if (!roles || roles.length === 0) {
            return <span className="text-muted">—</span>;
          }

          // single
          return <>{roles[0].name}</>;

          // OR if you want multiple roles:
          // return roles.map((r: any) => r.name).join(", ");
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        cell: (cellProps: any) => {
          return <Status {...cellProps} />;
        },
      },
      {
        header: "Date Created",
        accessorKey: "created_at",
        enableColumnFilter: false,
        cell: (cellProps: any) =>
          new Date(cellProps.getValue()).toLocaleDateString(),
      },
      {
        header: "Actions",
        cell: (cellProps: any) => {
          return (
            <Dropdown drop="up-centered" className="dropup-center">
              <Dropdown.Toggle
                as="button"
                type="button"
                className="btn btn-soft-secondary btn-sm arrow-none"
              >
                <i className="ri-more-fill align-middle"></i>
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu-end">
                <li>
                  <Dropdown.Item href="/apps-tickets-details">
                    <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                    View
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item
                    className="edit-item-btn"
                    href="#showModal"
                    data-bs-toggle="modal"
                    onClick={() => {
                      const userData = cellProps.row.original;
                      handleEditUser(userData);
                      setUser(userData);
                      setIsChangePassword(false);
                      setIsEdit(true);
                      setModal(true);
                    }}
                  >
                    <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                    Edit
                  </Dropdown.Item>
                </li>
                <li>
                  <Dropdown.Item
                    className="edit-item-btn"
                    href="#showModal"
                    data-bs-toggle="modal"
                    onClick={() => {
                      const userData = cellProps.row.original;
                      setUser(userData);
                      setIsEdit(false);
                      setIsChangePassword(true);
                      setModal(true);
                    }}
                  >
                    <i className="ri-lock-fill align-bottom me-2 text-muted"></i>{" "}
                    Change Password
                  </Dropdown.Item>
                </li>
                <li
                  style={{
                    display: cellProps.row.original.id === 1 ? "none" : "block",
                  }}
                >
                  <Dropdown.Divider />
                  <Dropdown.Item
                    className="remove-item-btn"
                    data-bs-toggle="modal"
                    href="#deleteOrder"
                    onClick={() => {
                      setUser(cellProps.row.original);
                      setDeleteModal(true);
                    }}
                  >
                    <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                    Delete
                  </Dropdown.Item>
                </li>
              </Dropdown.Menu>
            </Dropdown>
          );
        },
      },
    ],
    [checkedAll]
  );

  const Status = (cell: any) => {
    return (
      <React.Fragment>
        {cell.getValue() === "inactive" ? (
          <span className="badge bg-danger-subtle  text-danger text-uppercase">
            {cell.getValue()}
          </span>
        ) : cell.getValue() === "active" ? (
          <span className="badge bg-info-subtle  text-info text-uppercase">
            {cell.getValue()}
          </span>
        ) : null}
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Head title="Users | HS Admin" />

      <Row>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteUser}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
      </Row>

      <Modal
        show={modal}
        onHide={toggle}
        centered
        size="lg"
        className="border-0"
        dialogClassName="zoomIn"
      >
        <Modal.Header className="p-3 bg-info-subtle" closeButton>
          <h5 className="modal-title">
            {!!isEdit
              ? "Edit User"
              : isChangePassword
              ? "Change Password"
              : "Add User"}
          </h5>
        </Modal.Header>
        <Form
          className="tablelist-form"
          onSubmit={(e: any) => {
            e.preventDefault();
            validation.handleSubmit();
            return false;
          }}
        >
          <Modal.Body>
            {!isChangePassword ? (
              <Row className="g-3">
                <Col lg={12}>
                  <div>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      name="name"
                      isInvalid={!!validation.errors.name}
                      placeholder="Enter name"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.name}
                    />
                    {validation.touched.name && validation.errors.name ? (
                      <Form.Control.Feedback type="invalid">
                        {validation.errors.name}
                      </Form.Control.Feedback>
                    ) : null}
                  </div>
                </Col>
                <Col lg={12}>
                  <div>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      isInvalid={!!validation.errors.email}
                      placeholder="Enter email"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.email}
                    />
                    {validation.touched.email && validation.errors.email ? (
                      <Form.Control.Feedback type="invalid">
                        {validation.errors.email}
                      </Form.Control.Feedback>
                    ) : null}
                  </div>
                </Col>
                {!isEdit && (
                  <>
                    <Col lg={6}>
                      <div>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          isInvalid={!!validation.errors.password}
                          placeholder="Enter password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.password}
                        />
                        {validation.touched.password &&
                        validation.errors.password ? (
                          <Form.Control.Feedback type="invalid">
                            {validation.errors.password}
                          </Form.Control.Feedback>
                        ) : null}
                      </div>
                    </Col>
                    <Col lg={6}>
                      <div>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password_confirmation"
                          isInvalid={!!validation.errors.password_confirmation}
                          placeholder="Confirm password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.password_confirmation}
                        />
                        {validation.touched.password_confirmation &&
                        validation.errors.password_confirmation ? (
                          <Form.Control.Feedback type="invalid">
                            {validation.errors.password_confirmation}
                          </Form.Control.Feedback>
                        ) : null}
                      </div>
                    </Col>
                  </>
                )}
                <Col lg={6}>
                  <Form.Label className="form-label">Role</Form.Label>

                  <Select
                    value={
                      validation.values.roles.length
                        ? {
                            value: Number(validation.values.roles[0]),
                            label: roles.find(
                              (r) => r.id === Number(validation.values.roles[0])
                            )?.name,
                          }
                        : null
                    }
                    onChange={(option: any) => {
                      validation.setFieldValue("roles", [Number(option.value)]);
                    }}
                    options={roles.map((role) => ({
                      value: role.id,
                      label: role.name,
                    }))}
                    className="js-example-basic-single mb-0"
                  />

                  {validation.touched.status && validation.errors.status ? (
                    <Form.Control.Feedback type="invalid">
                      {validation.errors.status}
                    </Form.Control.Feedback>
                  ) : null}
                </Col>
                <Col lg={6}>
                  <Form.Label htmlFor="status" className="form-label">
                    Status
                  </Form.Label>
                  <Select
                    value={
                      validation.values.status
                        ? {
                            value: validation.values.status,
                            label:
                              validation.values.status.charAt(0).toUpperCase() +
                              validation.values.status.slice(1),
                          }
                        : null
                    }
                    onChange={(sortBy: any) => {
                      validation.setFieldValue("status", sortBy.value);
                    }}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ]}
                    id="choices-single-default"
                    className=" mb-0"
                    name="state"
                  />
                  {validation.touched.status && validation.errors.status ? (
                    <Form.Control.Feedback type="invalid">
                      {validation.errors.status}
                    </Form.Control.Feedback>
                  ) : null}
                </Col>
              </Row>
            ) : (
              <Row className="g-3">
                <Col lg={6}>
                  <div>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={validation.values.password}
                      placeholder="************"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      isInvalid={
                        !!validation.touched.password &&
                        !!validation.errors.password
                      }
                    />
                    {validation.touched.password &&
                    validation.errors.password ? (
                      <Form.Control.Feedback type="invalid">
                        {validation.errors.password}
                      </Form.Control.Feedback>
                    ) : null}
                  </div>
                </Col>
                <Col lg={6}>
                  <div>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password_confirmation"
                      value={validation.values.password_confirmation}
                      placeholder="************"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      isInvalid={
                        !!validation.touched.password_confirmation &&
                        !!validation.errors.password_confirmation
                      }
                    />
                    {validation.touched.password_confirmation &&
                    validation.errors.password_confirmation ? (
                      <Form.Control.Feedback type="invalid">
                        {validation.errors.password_confirmation}
                      </Form.Control.Feedback>
                    ) : null}
                  </div>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <div className="modal-footer">
            <div className="hstack gap-2 justify-content-end">
              <button onClick={toggle} type="button" className="btn btn-light">
                Close
              </button>
              <button type="submit" className="btn btn-success" id="add-btn">
                {!!isEdit
                  ? "Update"
                  : isChangePassword
                  ? "Change Password"
                  : "Add User"}
              </button>
            </div>
          </div>
        </Form>
      </Modal>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col xl={12}>
              <Card>
                <Card.Header className="border-0">
                  <div className="d-flex align-items-center">
                    <h5 className="card-title mb-0 flex-grow-1">Users</h5>
                    <div className="flex-shrink-0">
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary add-btn"
                          onClick={() => {
                            setIsEdit(false);
                            setIsChangePassword(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom"></i> Create
                          User
                        </button>{" "}
                        {isMultiDeleteButton && (
                          <button
                            className="btn btn-soft-danger"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0">
                  {userData && userData.length > 0 ? (
                    <TableContainer
                      columns={columns}
                      data={userData || []}
                      isGlobalFilter={true}
                      customPageSize={8}
                      divClass="table-card mb-3"
                      tableClass="align-middle table-nowrap mb-0"
                      theadClass=""
                      thClass=""
                      handleTicketClick={handleUsersClicks}
                      isTicketsListFilter={false}
                      SearchPlaceholder="Search for user or something..."
                    />
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i className="ri-user-line fs-1 mb-3 d-block"></i>
                      <h5>No users found</h5>
                      <p>Create your first user to get started.</p>
                    </div>
                  )}
                  <ToastContainer closeButton={false} limit={1} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

UsersIndex.layout = (page: any) => <Layout children={page} />;
export default UsersIndex;
