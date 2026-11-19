package com.powerledger.suburbia.service;

import com.powerledger.suburbia.models.Postcode;

import java.util.ArrayList;

public interface PostcodeService {

    ArrayList<Postcode> postPostCode(ArrayList<Postcode> codes);

    String getNames(int fromPostCode, int toPostCode);

    ArrayList<Postcode> getByState(String state);

}
