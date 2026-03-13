"use client"
import Card from "@/components/ui/Card";
import H1 from "@/components/ui/H1";
import Image from "next/image";
import { useEffect, useState } from "react";
import onyxtech from '../../../assets/onyxtech.png';
import useGoogleMapLoad from "@/hooks/useGoogleMapLoad";
import { IRegisterSharedInterface } from '@common/IRegisterSharedInterface';
import { redirect } from "next/navigation";
import { useModal } from "@/hooks/useModal";
import RegisterSuccess from "@/components/RegisterSuccess";


export default function Register() {
    const [logo, setLogo] = useState<string | null>(null);
    const { openModal } = useModal();

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:4000/api';


    const [data, setData] = useState<IRegisterSharedInterface<string>>({
        firstName: '',
        middleName: '',
        lastName: '',
        fullName: '',
        emailId: '',
        companyName: '',
        mobileNumber: '',
        phoneNumber: '',
        companyWebsite: '',
        companyAddress: '',
        country: '',
        zipCode: '',
        latitude: 0,
        longitude: 0,
        password: '',
        confirmPassword: '',
        logo: '',
        termsSelected: false
    });

    function cancel() {
        redirect('/auth/signIn');
    }
    const googleMapLoader = useGoogleMapLoad();
    useEffect(() => {
        if (!googleMapLoader) return;
        if (!window.google) return;

        const input = document.getElementById('address') as HTMLInputElement;
        if (!input) return;

        const autocomplete = new google.maps.places.Autocomplete(input);

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.place_id) return;

            const service = new google.maps.places.PlacesService(document.createElement('div'));
            service.getDetails({ placeId: place.place_id }, (result, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    const address = result.formatted_address ?? "";
                    const postalCode = result.address_components?.find(c => c.types.includes('postal_code'))?.long_name ?? "";
                    const country = result.address_components?.find(c => c.types.includes('country'))?.long_name ?? "";
                    const lat = result.geometry?.location?.lat() ?? 0;
                    const lng = result.geometry?.location?.lng() ?? 0;

                    setData((pre) => {
                        const updateData = {
                            ...pre,
                            companyAddress: address,
                            zipCode: postalCode,
                            country: country,
                            latitude: lat,
                            longtitude: lng
                        }
                        return updateData;
                    })
                }
            });

        });

        return () => {
            listener.remove(); // cleanup listener
        };
    }, [googleMapLoader]);

    async function save() {
        if (data.firstName === '') {
            alert('Please enter first name.');
            return;
        } else if (data.emailId === '') {
            alert('Please enter email id.');
            return;
        } else if (data.companyName === '') {
            alert('Please enter shop name.');
            return;
        } else if (data.mobileNumber === '') {
            alert('Please enter mobile number.');
            return;
        } else if (data.companyAddress === '') {
            alert('Please select company address.');
            return;
        } else if (data.password === '') {
            alert('Please enter password.');
            return;
        } else if (data.password !== data.confirmPassword) {
            alert('Password & confirm password must be same.');
            return;
        } else if (!data.termsSelected) {
            alert('Please agree on the terms.');
            return;
        }

        try {
            const formData = new FormData();

            Object.entries(data).forEach(([key, value]) => {
                formData.append(key, String(value));
            });

            // logo file
            const logoInput = document.getElementById('logo') as HTMLInputElement;
            if (logoInput?.files?.[0]) {
                formData.append('logo', logoInput.files[0]);
            }

            const res = await fetch(`${API_BASE_URL}/register/shop`, {
                method: 'POST',
                body: formData
            });

            const result = await res.json();

            if (!res.ok) {
                alert(result.message || 'Registration failed');
                return;
            }

            // success
            openModal(<RegisterSuccess />);

        } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again.');
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        console.log('Name: ', name);
        console.log('Value: ', value);


        if (name === 'logo') {
            const file = e.target.files?.[0];
            if (file) {
                const imgUrl = URL.createObjectURL(file);
                setLogo(imgUrl);

            }
        }
        setData((pre) => {
            const updatedData = { ...pre, [name]: value }
            return updatedData;
        })



    }
    if (!googleMapLoader) return <Card className="w-full max-w-3xl"><div>Google Map API Loading...</div></Card>

    return (
        <Card className="w-full max-w-3xl">
            <H1>Create your showroom</H1>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="firstName">First Name <span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="firstName"
                        id="firstName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter first name." />
                </div>
                <div className="w-1/2">
                    <label htmlFor="middleName">Middle Name</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="middleName"
                        id="middleName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter last name." />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="lastName"
                        id="lastName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter last name." />
                </div>
                <div className="w-1/2">
                    <label htmlFor="email">Email Id <span className="text-red-500">*</span> </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="email"
                        name="emailId"
                        id="emailId"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter email id (Unique)." />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="companyName">Shop Name <span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="companyName"
                        id="companyName"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter your company name." />
                </div>
                <div className="w-1/2">
                    <label htmlFor="mobileNumber">Mobile Number <span className="text-red-500">*</span> </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="mobileNumber"
                        id="mobileNumber"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter mobile number." />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter your company phone number." />
                </div>
                <div className="w-1/2">
                    <label htmlFor="website">Company website </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="companyWebsite"
                        id="companyWebsite"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter company website." />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-full">
                    <label htmlFor="address">Address <span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="companyAddress"
                        id="address"
                        onChange={handleChange}
                        value={data.companyAddress}
                        placeholder="Please enter company address." />
                </div>


            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="country">Country</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="country"
                        id="country"
                        onChange={handleChange}
                        value={data.country}
                        placeholder="auto fill with address select."
                        readOnly
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="zipCode">Zip Code </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="zipCode"
                        id="zipCode"
                        onChange={handleChange}
                        value={data.zipCode}
                        placeholder="Auto fill with address select."
                        readOnly
                    />
                </div>

            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="latitude"
                        id="latitude"
                        onChange={handleChange}
                        value={data.latitude}
                        placeholder="auto fill with address select."
                        readOnly
                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="longtitude"
                        id="longtitude"
                        onChange={handleChange}
                        value={data.longitude}
                        placeholder="Auto fill with address select."
                        readOnly
                    />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <label htmlFor="password">Password <span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="password"
                        name="password"
                        id="password"
                        onChange={(e) => handleChange(e)}
                        placeholder="Enter secure password."

                    />
                </div>
                <div className="w-1/2">
                    <label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                        type="text"
                        name="confirmPassword"
                        id="confirmPassword"
                        onChange={(e) => handleChange(e)}
                        placeholder="Please re-enter password."

                    />
                </div>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-full bg-[#FAFAFA] p-4 rounded-lg text-center cursor-pointer">

                    <label
                        htmlFor="logo"
                        className="cursor-pointer text-gray-700 font-medium py-2"
                    >
                        📁 Click to Upload Logo
                    </label>
                    <input
                        type="file"
                        name="logo"
                        id="logo"
                        className="hidden"
                        onChange={handleChange}
                    />
                </div>

            </div>
            <div className="flex gap-2 py-2">
                <Image src={logo || onyxtech} alt="Logo" className="w-48 h-auto" width={150} height={150} />
            </div>
            <div className="flex gap-2 py-2 items-center">
                <input type="checkbox" onChange={(e) => handleChange(e)} name="termsSelected" id="termsSelected" className="h-4 w-4" />
                <label htmlFor="termsSelected" className="text-black">By proceeding, you agree to the <span className="text-orange-500">Terms and Conditions</span><span className="text-red-500 ml-2">(required *)</span></label>
            </div>
            <div className="flex gap-2 py-2">
                <div className="w-1/2">
                    <button className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition cursor-pointer"
                        onClick={save}
                    >Sign Up</button>
                </div>
                <div className="w-1/2">
                    <button className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition cursor-pointer" onClick={cancel}>Cancel</button>
                </div>
            </div>

        </Card>
    )
}